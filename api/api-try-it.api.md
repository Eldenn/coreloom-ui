# @coreloom/api-try-it

Stability: experimental. Written by `pnpm api:report` from the code; don't edit it by hand.

## src/components/api-try-it.tsx

```ts
type ApiEndpoint = {}
ApiEndpoint.method: HttpMethod
ApiEndpoint.path: string
ApiEndpoint.summary?: string | undefined
ApiEndpoint.parameters?: ApiParameter[] | undefined
ApiEndpoint.body?: {}
ApiEndpoint.body.example: string
ApiEndpoint.body.contentType?: string | undefined
type ApiParameter = {}
ApiParameter.name: string
ApiParameter.in: 'header' | 'path' | 'query'
ApiParameter.required?: boolean | undefined
ApiParameter.description?: string | undefined
ApiParameter.example?: string | undefined
type ApiParamValues = { [x: string]: string; }
type ApiRequest = {}
ApiRequest.method: HttpMethod
ApiRequest.url: string
ApiRequest.headers: [string, string][]
ApiRequest.body?: string | undefined
type ApiResponse = {}
ApiResponse.status: number
ApiResponse.statusText?: string | undefined
ApiResponse.headers: [string, string][]
ApiResponse.body: string
ApiResponse.durationMs?: number | undefined
function ApiTryIt
ApiTryIt.endpoint: ApiEndpoint
ApiTryIt.baseUrl: string
ApiTryIt.onSend: (request: ApiRequest, options: { signal: AbortSignal; }) => Promise<ApiResponse>
ApiTryIt.auth?: ApiTryItAuth | undefined
ApiTryIt.defaultValues?: ApiParamValues | undefined
ApiTryIt.defaultResponse?: ApiResponse | undefined
ApiTryIt.title?: React.ReactNode
ApiTryIt.className?: string | undefined
type ApiTryItAuth = {}
ApiTryItAuth.header?: string | undefined
ApiTryItAuth.prefix?: string | undefined
ApiTryItAuth.defaultToken?: string | undefined
ApiTryItAuth.label?: string | undefined
type ApiTryItProps = {}
ApiTryItProps.endpoint: ApiEndpoint
ApiTryItProps.baseUrl: string
ApiTryItProps.onSend: (request: ApiRequest, options: { signal: AbortSignal; }) => Promise<ApiResponse>
ApiTryItProps.auth?: ApiTryItAuth | undefined
ApiTryItProps.defaultValues?: ApiParamValues | undefined
ApiTryItProps.defaultResponse?: ApiResponse | undefined
ApiTryItProps.title?: React.ReactNode
ApiTryItProps.className?: string | undefined
function bodySize(body: string) => number
function buildRequest(input: { baseUrl: string; endpoint: ApiEndpoint; values: ApiParamValues; headers?: { key: string; value: string; }[]; body?: string; auth?: { header: string; value: string; }; }) => { ok: true; request: ApiRequest; } | { ok: false; missing: string[]; }
function buildRequestUrl(baseUrl: string, endpoint: ApiEndpoint, values: ApiParamValues) => BuiltUrl
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
function parseResponseBody(response: Pick<ApiResponse, 'body' | 'headers'>) => ResponseBody
type ResponseBody = { kind: 'json'; value: unknown; } | { kind: 'text'; text: string; }
function shellQuote(value: string) => string
type StatusKind = 'success' | 'info' | 'redirect' | 'clientError' | 'serverError'
function statusKind(status: number) => StatusKind
function toCurl(request: ApiRequest) => string
```

## src/components/api-try-it-request.ts

```ts
function allowsBody(method: HttpMethod) => method is 'POST' | 'PUT' | 'PATCH'
type ApiEndpoint = {}
ApiEndpoint.method: HttpMethod
ApiEndpoint.path: string
ApiEndpoint.summary?: string | undefined
ApiEndpoint.parameters?: ApiParameter[] | undefined
ApiEndpoint.body?: {}
ApiEndpoint.body.example: string
ApiEndpoint.body.contentType?: string | undefined
type ApiParameter = {}
ApiParameter.name: string
ApiParameter.in: 'header' | 'path' | 'query'
ApiParameter.required?: boolean | undefined
ApiParameter.description?: string | undefined
ApiParameter.example?: string | undefined
type ApiParamValues = { [x: string]: string; }
type ApiRequest = {}
ApiRequest.method: HttpMethod
ApiRequest.url: string
ApiRequest.headers: [string, string][]
ApiRequest.body?: string | undefined
type ApiResponse = {}
ApiResponse.status: number
ApiResponse.statusText?: string | undefined
ApiResponse.headers: [string, string][]
ApiResponse.body: string
ApiResponse.durationMs?: number | undefined
function bodySize(body: string) => number
function buildRequest(input: { baseUrl: string; endpoint: ApiEndpoint; values: ApiParamValues; headers?: { key: string; value: string; }[]; body?: string; auth?: { header: string; value: string; }; }) => { ok: true; request: ApiRequest; } | { ok: false; missing: string[]; }
function buildRequestUrl(baseUrl: string, endpoint: ApiEndpoint, values: ApiParamValues) => BuiltUrl
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
function missingParams(endpoint: ApiEndpoint, values: ApiParamValues) => string[]
function parseResponseBody(response: Pick<ApiResponse, 'body' | 'headers'>) => ResponseBody
function pathParamNames(path: string) => string[]
function previewUrl(baseUrl: string, endpoint: ApiEndpoint, values: ApiParamValues) => string
type ResponseBody = { kind: 'json'; value: unknown; } | { kind: 'text'; text: string; }
function shellQuote(value: string) => string
type StatusKind = 'success' | 'info' | 'redirect' | 'clientError' | 'serverError'
function statusKind(status: number) => StatusKind
function toCurl(request: ApiRequest) => string
```

## src/components/api-try-it-form.tsx

```ts
function BodyField
BodyField.id: string
BodyField.value: string
BodyField.invalid: boolean
BodyField.onChange: (body: string) => void
type FormAction = { type: 'value'; name: string; value: string; } | { type: 'headers'; headers: KeyValuePair[]; } | { type: 'body'; body: string; } | { type: 'token'; token: string; } | { type: 'check'; }
function formReducer(state: FormState, action: FormAction) => FormState
type FormState = {}
FormState.values: ApiParamValues
FormState.headers: KeyValuePair[]
FormState.body: string
FormState.token: string
FormState.checked: boolean
function HeadersField
HeadersField.id: string
HeadersField.value: KeyValuePair[]
HeadersField.onChange: (headers: KeyValuePair[]) => void
function ParamFields
ParamFields.legend: string
ParamFields.params: ApiParameter[]
ParamFields.form: FormState
ParamFields.missing: ReadonlySet<string>
ParamFields.idFor: (name: string) => string
ParamFields.onChange: (name: string, value: string) => void
function SendActions
SendActions.formId: string
SendActions.sending: boolean
SendActions.request: ApiRequest | undefined
SendActions.sendRef: React.Ref<HTMLButtonElement>
SendActions.onCancel: () => void
function TokenField
TokenField.id: string
TokenField.label?: string | undefined
TokenField.header: string
TokenField.value: string
TokenField.onChange: (value: string) => void
```

## src/components/api-try-it-response.tsx

```ts
function ApiResponseView
ApiResponseView.response: ApiResponse
```
