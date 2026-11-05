// Example diagrams for the UML stories, written as Mermaid or PlantUML and read with parseMermaid
// or parsePlantUml, the way an app would load them.
import type { UmlSpec } from '@/lib/uml'
import { parseMermaid } from '@/lib/uml-mermaid'
import { parsePlantUml } from '@/lib/uml-plantuml'

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

export const activityText = `flowchart TB
  start@{ shape: sm-circ }
  subgraph Shop
    Cart("Fill the cart")
    Check("Check out")
  end
  subgraph Warehouse
    Pack("Pack the order")
    Ship("Ship it")
  end
  Paid{"Paid?"}
  split@{ shape: fork }
  Mail("Send the receipt")
  merged@{ shape: join }
  done@{ shape: fr-circ }
  start --> Cart --> Check --> Paid
  Paid -->|no| Cart
  Paid -->|yes| split
  split --> Pack --> Ship --> merged
  split --> Mail --> merged
  merged --> done`

export const usecaseText = `@startuml
left to right direction
actor Customer
actor "Payment provider" as Provider
actor Clerk
rectangle "Online shop" {
  usecase "Browse the catalogue" as Browse
  usecase "Place an order" as Order
  usecase "Pay" as Pay
  usecase "Apply a coupon" as Coupon
  usecase "Refund an order" as Refund
}
Customer -- Browse
Customer -- Order
Clerk -- Refund
Order ..> Pay : <<include>>
Coupon ..> Order : <<extend>>
Pay -- Provider
Refund -- Provider
@enduml`

export const deploymentText = `@startuml
cloud "AWS eu-west-1" as aws {
  node "Load balancer" as lb
  node "App server" as app <<executionEnvironment>> {
    artifact "api.jar" as api
    component "Worker" as worker
  }
  database "PostgreSQL" as db
}
node "Phone" as phone <<device>>
phone -- lb : HTTPS
lb -- app : HTTP
api -- db : JDBC
worker ..> db
@enduml`

export const componentText = `@startuml
component "Web shop" as shop
component "Checkout" as checkout <<subsystem>> {
  portin "orders" as orders
  component "Cart" as cart
  component "Pricing" as pricing
}
interface "Payments" as payments
component "Payment service" as pay <<service>>
component "Audit log" as audit
shop -(0)- orders
orders --> cart : <<delegate>>
cart ..> pricing
pay -- payments
checkout -( payments
checkout ..> audit
@enduml`

export const packageText = `@startuml
package "Web" as web {
  class "OrderController" as controller
  class "CartController" as cartController
}
package "Domain" as domain <<model>> {
  class "Order" as order
  interface "OrderRepository" as repository
  package "Pricing" as pricing {
  }
}
package "Persistence" as persistence {
  class "SqlOrderRepository" as sqlRepository
}
package "Shared kernel" as kernel {
}
web ..> domain : <<import>>
persistence ..> domain : <<import>>
domain ..> kernel : <<merge>>
controller ..> order
@enduml`

/** Reads one of the texts above; they're known to parse. */
export function fromMermaid(text: string): UmlSpec {
  const { diagram } = parseMermaid(text)
  if (!diagram) throw new Error('The example diagram must parse')
  return diagram
}

/** Reads one of the PlantUML texts above; they're known to parse. */
export function fromPlantUml(text: string): UmlSpec {
  const { diagram } = parsePlantUml(text)
  if (!diagram) throw new Error('The example diagram must parse')
  return diagram
}
