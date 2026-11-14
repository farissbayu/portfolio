---
title: "Case study: an MCP server that lets coding agents keep their own tickets"
description: "Majestik already tracked projects, tasks, and GitLab commits. The agents writing the code still could not reach the board, so I exposed it as MCP tools behind a scoped, expiring, revocable token."
publishedDate: 2026-11-14
tags: ["Case Study", "MCP", "Laravel", "AI/LLM", "Tooling"]
draft: false
featured: false
---

Majestik is the internal TIK asset management system for the Pasuruan Regency
Communication and Informatics Office: applications, hardware, network cables,
SOPs, and the projects that maintain all of it. The project module is not a
toy tracker. Every project has members, a kanban board where the *column* is
the status, activity records, and a self-hosted GitLab integration that reads
push webhooks and links commits back to tasks.

That integration is the part I am proud of, and it is also the part that
created the problem.

## The board nobody updated

Every developer on the team now writes code with an AI agent. The agent can
read the repository, run the tests, and open a merge request. What it cannot
do is open the Majestik board, create the ticket it is about to work on, move
it to *In Progress*, and move it to *QC* when the branch is pushed.

So the board drifted. Work started in a chat window and became a ticket
afterwards, or never. Commit messages kept referencing `PRJ-12` for tasks
that had been renamed twice, because a human had to remember to rename them.
The GitLab tracking I built to answer "who touched this and why" was recording
history for a board that no longer matched reality.

The obvious fix is "just use the UI, it takes ten seconds". It does, and that
is exactly the problem: ten seconds at the moment of maximum context, repeated
five times a day, is a tax the agent will always pay worse than the human.
Anything that lives outside the agent's tool loop will be skipped.

So the board needed to be inside the loop.

## Why MCP instead of a REST client or a CLI

Majestik already had web routes for every one of these operations. I could
have written a bash script or handed the agent an HTTP client and a spec. I
had tried the HTTP route on a smaller tool: it works until the model has to
guess a payload shape from a paragraph of documentation, and then it spends
three turns failing before a human steps in.

MCP is a better contract for the same reason an OpenAPI spec is better than a
README: the tool list, the JSON schema of every argument, and the error shape
are machine-readable and delivered at session start. The agent does not
discover `move_task` by reading a page. It is told `move_task` exists, that it
takes `task_id` and `column_id`, and that the column *is* the status.

There is a second, less obvious payoff: tool descriptions are prompts. My
`move_task` description literally says *"use this tool to mark a task done by
moving it to the Done column"*, because that is the sentence that stops the
model from inventing a `status` field that does not exist.

## No proxy, no second service

My first draft was a Node.js proxy that translated MCP calls into REST calls.
That draft was wrong, and killing it removed an entire deployment to maintain.

Laravel has a first-party MCP package now. `laravel/mcp` lets you define a
server and its tools in PHP, and because the tools run inside the Laravel
request lifecycle, they already have the same container, the same Eloquent
models, and the same service layer as the web UI.

The entire transport setup is one file:

```php
// routes/ai.php
use App\Mcp\Servers\MajestikServer;
use Laravel\Mcp\Facades\Mcp;

Mcp::web('/mcp/majestik', MajestikServer::class)
    ->middleware(['auth:ai-token', 'throttle:mcp']);
```

Streamable HTTP on the POST path, authenticated by the guard I wrote myself
(more on that below), rate limited. No SSE server to keep alive, no separate
process, no "which port is the MCP proxy on again".

## The server is a registry, nothing more

The server class does not hold business logic. It advertises what exists:

```php
#[Name('Majestik Project Server')]
#[Version('1.0.0')]
#[Instructions('Server ini mengekspos data project, task, dan inventaris TIK. Semua akses dibatasi pada data milik pengguna yang terautentikasi.')]
class MajestikServer extends Server
{
    protected array $tools = [
        GetProjectsTool::class,
        SearchProjectsTool::class,
        GetProjectDetailTool::class,
        GetProjectTasksTool::class,
        SearchTasksTool::class,
        GetTaskDetailTool::class,
        CreateTaskTool::class,
        UpdateTaskTool::class,
        MoveTaskTool::class,
        GetApplicationsTool::class,
        GetAssetsTool::class,
        // ...
    ];
}
```

Nine project tools, six inventory tools. The inventory tools exist because the
same agents are often asked to fix an application that is registered in
Majestik, and "what VPS does this app run on, who owns it, what is the SOP for
restarting it" is a five-table query the agent should not be doing over a web
search.

## Nine tools and one rule about status

`create_task` is the clearest example of what a tool looks like here. It is
also where most of the design decisions live:

```php
public function handle(Request $request): Response|ResponseFactory
{
    if ($abilityError = $this->ensureAbility($request, 'mcp:task-write')) {
        return $abilityError;
    }

    $validated = $request->validate([
        'project_id' => 'required|string',
        'column_id' => 'required|string',
        'nama_task' => 'required|string|max:255',
        'type' => 'nullable|in:task,ticket,bug,vulnerability',
        'prioritas' => 'nullable|in:low,medium,high,critical',
        'assignee_id' => 'nullable|string|exists:user,id_user',
        'due_date' => 'nullable|date',
    ]);

    $user = $this->user($request);
    $project = $this->projects->findForUser($user, $validated['project_id']);

    if (! $project) {
        return Response::error('Project tidak ditemukan atau Anda tidak memiliki akses.');
    }

    if (! $this->tasks->columnInProject($project, $validated['column_id'])) {
        return Response::error('Kolom tujuan tidak ditemukan pada project ini.');
    }

    if (! empty($validated['assignee_id'])
        && ! $this->projects->isMember($project, $validated['assignee_id'])) {
        return Response::error('User assignee bukan anggota project ini.');
    }

    return Response::structured([
        'task' => $this->taskSummary($this->tasks->create($user, $project, $validated)),
    ]);
}
```

Four things worth calling out.

**Validation is the same validator the web app uses.** `$request->validate()`
gives the agent back the field-level error so it can correct itself, instead
of an exception page it cannot read.

**`column_id` is required.** The board has no `status` column, because status
*is* the column. That is a schema fact the model cannot guess, so it is
enforced by validation and restated in the tool description. The first version
of this tool let `column_id` be optional and the agent happily wrote tasks
into a column that did not exist on that project; the `columnInProject` guard
is what turned that silent corruption into an error message.

**Errors are strings, not exceptions.** `Response::error()` becomes something
the model reads and reacts to. A thrown exception ends the turn.

**The error messages are Indonesian**, matching the rest of the app, because
the humans reading them are. The agent does not care; `gagal karena kamu bukan
anggota project` is as parseable as English.

Mutations carry MCP annotations so clients can reason about them:

```php
#[Name('move_task')]
#[IsIdempotent]
#[Description('Memindahkan task ke kolom/board lain. Gunakan tool ini untuk "menandai selesai" (pindah ke kolom Done).')]
class MoveTaskTool extends Tool
```

Moves and updates are declared idempotent, reads are declared `#[IsReadOnly]`.
That is what lets a client decide it can auto-approve `get_projects` but should
ask a human before `create_task`. Approval fatigue is a real adoption risk
here: if the agent asks permission for every read, developers disable the
prompts entirely and the guardrails stop mattering.

## Scoping is done once, in the service layer

The most important line in `create_task` is not the validation. It is:

```php
$project = $this->projects->findForUser($user, $validated['project_id']);
```

There is no tool that queries `Project::query()` directly. Every read and every
write goes through a service whose query is already scoped:

```php
public function queryFor(User $user): Builder
{
    $query = Project::query();

    if (! $this->isDeveloper($user)) {
        $query->whereHas('members', fn (Builder $q) => $q->where('user_id', $user->id_user));
    }

    return $query;
}

public function findForUser(User $user, string $projectId): ?Project
{
    return $this->queryFor($user)->where('id_project', $projectId)->first();
}
```

Developer accounts (`access_level === 2`) see everything; everyone else sees
only projects they are a member of. A token inherits exactly the visibility of
the human it belongs to, with no second permission system to keep in sync. The
MCP layer does not reimplement authorization, it just refuses to bypass it.

This is also why I did not simply call the existing web controllers. They use
an `AccessControl` trait whose `blockAction()` ends with `exit()`. That is fine
in a request that is about to render a 401 page; inside an MCP tool it kills
the response mid-flight and the agent gets a socket hang-up. The service layer
was extracted precisely so it could be called from both places and return
nulls instead of exiting.

## The token is mine, not Sanctum's

The guardrails the user asked about are the token. Majestik has no Sanctum, so
I wrote a small guard that mirrors the parts of Sanctum's token API the app
actually uses: `createToken()`, `currentAccessToken()`, `tokenCan()`.

The token format is `<prefix><random hex>`, so a leaked token is greppable and
recognizable:

```text
mjstk_9f2c4a1e7b3d58c0a6f4e21d...
```

Only two things are stored: a SHA-256 hash for lookup, and a Laravel-encrypted
copy so the owner can reveal the token later in the UI. Plaintext is never
written to the database.

```php
public static function generate(User $user, string $name, array $abilities, ?DateTimeInterface $expiresAt = null): array
{
    $plainText = self::generatePlainText();

    $token = $user->aiAccessTokens()->create([
        'name' => $name,
        'token_hash' => hash('sha256', $plainText),
        'token_encrypted' => Crypt::encryptString($plainText),
        'token_prefix' => mb_substr($plainText, 0, 14),
        'abilities' => array_values($abilities),
        'expires_at' => $expiresAt,
    ]);

    return ['token' => $token, 'plainText' => $plainText];
}
```

Lookup goes the other direction from the usual session guard: hash the bearer
value, find the row, check expiry, load the user, then stamp `last_used_at`.

```php
public function user(): ?Authenticatable
{
    if ($this->resolved) {
        return $this->user;
    }

    $this->resolved = true;

    $plainText = $this->bearerToken();

    if ($plainText === null) {
        return null;
    }

    $token = AiAccessToken::findByPlainText($plainText);

    if ($token === null || $token->isExpired()) {
        return null;
    }

    $user = $this->provider->retrieveById($token->user_id);

    if (! $user instanceof Authenticatable) {
        return null;
    }

    $token->forceFill(['last_used_at' => now()])->saveQuietly();

    if ($user instanceof User) {
        $user->withAccessToken($token);
    }

    return $this->user = $user;
}
```

The `saveQuietly()` matters: a token check should not fire model events, not
the least because this is the hottest path in the whole MCP server.

## Abilities are the real scope

Authentication answers *who*. Abilities answer *what may this particular token
do*, which is the part that makes distributing tokens safe. A read-only token
handed to an agent working on a quarterly report cannot create tickets, even if
its owner can.

Four abilities cover the whole server:

```php
public const ABILITIES = [
    'mcp:project-read' => 'Baca project (get_projects, search_projects, get_project_detail)',
    'mcp:task-read'    => 'Baca task (get_project_tasks, search_tasks, get_task_detail)',
    'mcp:task-write'   => 'Tulis task (create_task, update_task, move_task)',
    'mcp:inventory-read' => 'Baca inventaris (aplikasi, aset, infrastruktur, jaringan, SOP)',
];
```

Enforcement is a one-line preamble in every tool, before any query runs:

```php
protected function ensureAbility(Request $request, string $ability): ?Response
{
    $user = $request->user();

    if (! $user instanceof Authenticatable) {
        return Response::error('Anda harus terautentikasi untuk menggunakan tool ini.');
    }

    $hasToken = method_exists($user, 'currentAccessToken')
        && $user->currentAccessToken() !== null;

    if ($hasToken && ! $user->tokenCan($ability)) {
        return Response::error("Token tidak memiliki izin \"{$ability}\".");
    }

    return null;
}
```

Because abilities are checked in a shared trait and the data scope is checked
in the service, a new tool cannot accidentally ship unscoped: it either calls
`ensureAbility` and a scoped service, or it fails the tests.

## Rate limits, expiry, revocation

Three mundane controls, all of them the ones that actually get used:

- **60 requests per minute per user**, keyed by user id and falling back to IP,
  via a named limiter on the route.
- **Optional expiry** per token, set at creation. Good for agents on a
  short-lived project or a contractor.
- **Revocation is a row delete.** No cache to flush, no JWT to wait out.

The reveal endpoint is restricted to the token's owner and sends
`Cache-Control: no-store`, because a token that lands in a browser cache is a
token that lands in a screenshot.

## Testing a protocol server without a network

The tests never open a socket. `laravel/mcp` ships a fake transporter and an
`actingAs()` helper, so a tool can be called directly:

```php
$response = MajestikServer::actingAs($user)->tool(GetProjectsTool::class, [
    'limit' => 10,
    'page' => 1,
]);

$response
    ->assertOk()
    ->assertSee('Punya Saya')
    ->assertDontSee('Punya Orang Lain')
    ->assertStructuredContent(fn (AssertableJson $json) => $json
        ->has('data', 1)
        ->has('meta.current_page')
        ->etc());
```

There is one test asserting the tool registry matches the list, because a
server whose schema silently loses a tool is a bug that only appears in an
agent's confused tool call. There are tests that a non-member cannot read a
project, cannot create a task in a foreign project's column, and that creating
a task writes both the task row and its activity record. The activity record
test exists because the board's audit trail is the reason the board is worth
maintaining at all.

## The loop that closed

The GitLab job parses commit messages for `<kode_project>-<task_number>`,
resolves the task, links the commit, and writes a `code_pushed` activity entry.
That was already there.

What changed is that the agent now creates `PRJ-12` before it starts, receives
the `full_task_id` in the tool response, and can put that exact string in the
commit subject. When the branch is pushed, the webhook links the commits to a
task that exists, on a board whose column is accurate, with an activity record
nobody had to type.

An inventory-adjacent side effect: the same token abilities let an agent answer
"which projects touch this application" through `search_projects` instead of a
human grepping the database, which made the monthly report generation cheaper
to verify.

## What I would change

- **Tool count is context budget.** Fifteen tools is fine; forty would be a
  prompt nobody wants to pay for on every session start. `laravel/mcp`'s tool
  search exists for that future, and I would rather add one flexible tool than
  three narrow ones.
- **Tokens in client config files are plaintext.** `mcp.json` in a developer's
  home directory means the token is readable by anything running as that user.
  Expiry is the mitigation, not a solution.
- **No OAuth.** Every developer pastes a token once. It works, and it is one
  more credential to rotate. If Majestik ever supports external clients, OAuth
  with the existing user accounts becomes worth the complexity.
- **I would add a `start_task` convenience tool** that creates the task *and*
  moves it in one call, because the current flow is two round trips for the
  most common action an agent takes.

## Takeaways

The expensive part of this feature was not the MCP layer. It was the
authorization question: who may this agent act as, on which projects, for how
long. Answering it inside the existing service layer instead of building a
parallel permission system is what kept the diff to fifteen small classes and
one route.

The board is now something an agent maintains, and the GitLab history has
stopped lying. That was the whole goal. The tooling is a side effect.
