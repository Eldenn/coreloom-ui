// Example diagrams for the UML stories, written as Mermaid and read with parseMermaid, the way an
// app would load them.
import type { UmlSpec } from '@/lib/uml'
import { parseMermaid } from '@/lib/uml-mermaid'

export const classText = `---
title: Orders
---
classDiagram
  class Customer {
    +String id
    +String email
    +placeOrder(cart) Order
  }
  class Order {
    <<entity>>
    +String id
    -OrderStatus status
    +total() Money
    +cancel() void
  }
  class LineItem {
    +int quantity
    +Money price
  }
  class Payment {
    <<abstract>>
    +Money amount
    +capture()* bool
  }
  class CardPayment {
    -String token
  }
  class BankTransfer {
    -String iban
  }
  class OrderRepository {
    <<interface>>
    +find(id) Order
    +save(order) void
  }
  Customer "1" --> "*" Order : places
  Order *-- "1..*" LineItem
  Order o-- Payment
  Payment <|-- CardPayment
  Payment <|-- BankTransfer
  OrderRepository ..> Order
  note for Order "Totals are computed,\\nnever stored"`

export const sequenceText = `sequenceDiagram
  autonumber
  actor U as Shopper
  participant W as Web app
  participant API
  participant P as Payments
  U->>W: Pay
  W->>+API: POST /orders/42/pay
  API->>+P: Charge card
  alt card accepted
    P-->>API: 201 Created
    API-->>W: Paid
  else declined
    P-->>-API: 402 Payment required
    API-->>W: Declined
  end
  deactivate API
  Note over W,API: Idempotency key on every retry
  W-)U: Receipt by e-mail`

export const stateText = `stateDiagram-v2
  [*] --> Draft
  state "In review" as Review
  Draft --> Review : submit
  Review --> Draft : changes requested
  Review --> decision
  state decision <<choice>>
  decision --> Published : approved
  decision --> Rejected : declined
  state Published {
    [*] --> Live
    Live --> Archived : after a year
    Archived --> [*]
  }
  Published --> [*]
  Rejected --> [*]
  note right of Draft : Only the author sees it`

export const erText = `erDiagram
  CUSTOMER ||--o{ ORDER : places
  ORDER ||--|{ LINE_ITEM : contains
  PRODUCT ||--o{ LINE_ITEM : "appears in"
  CUSTOMER {
    uuid id PK
    string email UK
    string name
  }
  ORDER {
    uuid id PK
    uuid customer_id FK
    timestamp placed_at
  }
  LINE_ITEM {
    uuid order_id PK, FK
    uuid product_id PK, FK
    int quantity
  }
  PRODUCT {
    uuid id PK
    string name
    decimal price
  }`

export const c4ContextText = `C4Context
  title Internet banking: system context
  Person(customer, "Personal customer", "Has bank accounts")
  System(banking, "Internet banking", "Lets customers see and move their money")
  System_Ext(mail, "E-mail system", "Microsoft Exchange")
  SystemDb_Ext(core, "Core banking", "Accounts and transactions")
  Rel(customer, banking, "Views balances, makes payments")
  Rel(banking, mail, "Sends e-mails", "SMTP")
  Rel(banking, core, "Reads and writes", "XML/HTTPS")
  Rel(mail, customer, "Sends e-mails to")`

export const c4ContainerText = `C4Container
  title Internet banking: containers
  Person(customer, "Personal customer")
  System_Boundary(banking, "Internet banking") {
    Container(spa, "Single-page app", "React", "Everything the customer does")
    Container(api, "API", "Go", "Banking features over JSON/HTTPS")
    ContainerDb(db, "Database", "PostgreSQL", "Users, sessions, audit")
    ContainerQueue(events, "Events", "Kafka")
  }
  System_Ext(core, "Core banking")
  Rel(customer, spa, "Uses", "HTTPS")
  Rel(spa, api, "Calls", "JSON/HTTPS")
  Rel(api, db, "Reads and writes", "SQL")
  Rel(api, events, "Publishes to")
  Rel(api, core, "Uses", "XML/HTTPS")`

/** Reads one of the texts above; they're known to parse. */
export function fromMermaid(text: string): UmlSpec {
  const { diagram } = parseMermaid(text)
  if (!diagram) throw new Error('The example diagram must parse')
  return diagram
}
