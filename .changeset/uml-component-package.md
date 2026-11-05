---
'@coreloom/ui': minor
---

### Added

- **Component diagrams** (`kind: 'component'`) in `@coreloom/uml` and `@coreloom/uml-diagram`.
  - Elements are components, interfaces and ports. A component holds others through `parent` and is then drawn as a frame.
  - A port sits on its component's edge, half the ports on the left side and half on the right. A dragged port stays where it was put.
  - Interfaces are drawn as lollipops.
  - Relations: `provide` (a plain line to the lollipop), `require` (a socket round it), `assembly` (a ball in a socket), `delegate` (an arrow marked «delegate») and `dependency` (a dashed arrow, the default).
  - Elements take a `stereotype`.
- **Package diagrams** (`kind: 'package'`).
  - Packages are drawn as folders. A package that holds others is a frame with its name in the tab.
  - They contain classes, interfaces and components.
  - Relations: `dependency` (the default), `import` and `merge`, as dashed arrows marked «import» and «merge».
- `parseUmlJson` checks both kinds.
- `parsePlantUml` reads both, and `toPlantUml` writes them back.
  - Component diagrams: `component`, `[Name]`, `interface`, `() Name`, `port` / `portin` / `portout`, groupings in braces. Lines: `-(` requires, `-(0)-` is an assembly, `<<delegate>>` delegates.
  - Package diagrams: `package` in braces around `class`, `interface`, `enum` and components. Lines: `<<import>>` and `<<merge>>`.
- Mermaid has neither kind: `toMermaid` writes them as a flowchart, and the diagram editor turns Mermaid off in its format switch.
- The diagram editor's tools add components, interfaces, ports and packages, and connect them with the kinds above. Its "New diagram" menu and the diagram workspace's Add menu offer both kinds. The properties panel edits the stereotype, with a hint for each kind.
- Strings for both kinds in English, French, Spanish and German.

### Changed

- In a PlantUML text with packages, no `<<import>>` or `<<merge>>`, no class members in braces and no inheritance, composition or aggregation lines, the text is now read as a package diagram.
- A PlantUML text whose only elements are components, interfaces or ports is now read as a component diagram. A text with nodes, devices, databases or other deployment elements is still read as a deployment diagram.
- A component that holds others in a deployment diagram is drawn with a solid outline, as UML draws it, instead of a dashed one.
