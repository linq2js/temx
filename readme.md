# TEMX

Flexible ES6 Template Engine

## Installation

```
npm install temx --save
```

## Getting started

Once you have a template, use the tmpl method to compile the template into a function.
The generated function takes a model argument, which will be used to render the template.

```jsx
import { tmpl, each, end } from "temx"

const template = tmpl`
  <p>
    Hello, my name is ${x => x.name}. I am from ${x => x.hometown}.
    I have ${x => x.kids.length} kids:
  </p>
  <ul>
      ${each(x => x.kids, "kid")}
        <li>${x => x.kid.name} is ${x => x.kid.age}</li>
      ${end}
  </ul>`

const model = {
  name: "Alan",
  hometown: "Somewhere, TX",
  kids: [
    { name: "Jimmy", age: "12" },
    { name: "Sally", age: "4" },
  ],
}

const result = template(model)
```

**Output**

```
<p>Hello, my name is Alan. I am from Somewhere, TX. I have 2 kids:</p>
<ul>
    <li>Jimmy is 12</li>
    <li>Sally is 4</li>
</ul>
```

## Each block

### each(array, \[valueProp\[, keyProp]])

```jsx
tmpl`
  Fruits:
  ${each(["apple", "orange", "banana"], "fruit", "index")}
    ${x => x.index + 1}. ${x => x.fruit}
  ${end}
`
```

**Output**

```
Fruit
1. apple
2. orange
3. banana
```

### each(array, options)

```jsx
tmpl`
  Fruits:
  ${each(["apple", "orange", "banana"], {
    key: "index",
    value: "fruit",
    separator: "----------",
  })}
    ${x => x.index}. ${x => x.fruit}
  ${end}
`
```

### each(object)

```jsx
tmpl`
  Object Properties:
  ${each({ prop1: "value1", prop2: "value2" }, "value", "key")}
    ${x => x.key} = ${x => x.value}
  ${end}
`
```

**Output**

```
Object Properties:
prop1 = value1
prop2 = value2
```

## Conditional block

### when(condition)

```jsx
tmpl`
    ${when(x => x.error)}
        <p>${x => x.error}</p>
    ${end}
`({ error: "Something went wrong" })
```

### unless(condition)

```jsx
tmpl`
    ${unless(x => x.error)}
        <p>Successfully</p>
    ${end}
`({ error: null })
```

### when + unless

```jsx
tmpl`
    ${when(x => x.error)}
        <p>${x => x.error}</p>
    ${unless}
        <p>Successfully</p>
    ${end}
`({ error: "Something went wrong" })
```
