\---
# WebTemplates Skill Contracts



Each subdirectory is a Claude Code Agent Skill that encodes the design

contract, implementation recipe, and acceptance checks for one template

family.



| Skill | Family | Primary library |

| :--- | :--- | :--- |

| `disect-breakdown` | 3D exploded product teardown | Three.js + GSAP ScrollTrigger |

| `inspect-traverse-pov` | POV cinematic scroll traverse | GSAP ScrollTrigger + Canvas |

| `bold-minimalist-brand` | Editorial brand showcase | Framer Motion + Lenis |



\## How the CLI uses these



When you run `webtemplates new` and pick a template family, the CLI copies

the matching `SKILL.md` into the generated project at

`<project>/.claude/skills/<skill-name>/SKILL.md`. This makes every generated

site self-documenting:



\- Claude Code opening the project later will auto-discover the skill.

\- Future modifications inherit the exact design constraints and acceptance

&#x20; checks that produced the original build.

\- The contract survives repo cloning, zipping, and handoff to a client dev.



\## Adding a new skill



1\. Create `skills/<skill-name>/SKILL.md`.

2\. Add frontmatter with `name`, `description`, `license`, `compatibility`,

&#x20;  `allowed-tools`, and `metadata`.

3\. Add a generator module at `src/generators/<family>/index.js` that returns

&#x20;  the file map.

4\. Register the family in `src/templates.js`.

