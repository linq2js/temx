import { each, end, tmpl } from "./index";

const todos = [
  { id: 1, title: "item 1" },
  { id: 2, title: "item 2" },
];

const todoList$ = tmpl<typeof todos>`
  <ul>
    ${each(todos, "todo", "index")}
      <li>${({ todo, index }) => todo.completed}</li>
    ${end}
    ${each(todos, { separator: "," })}
      <li>${({ todo, index }) => todo.completed}</li>
    ${end}
  </ul>
`;

const bodyRenderer = (html: string) => (document.body.innerHTML = html);

todoList$(bodyRenderer, todos);
