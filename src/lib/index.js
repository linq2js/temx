export default { tmpl, end, each }

function evalConditionValue(context, condition) {
  if (typeof condition === "function") return condition(context)
  return !!condition
}

export function when(condition) {
  return Object.assign(
    new Block("when", (context, { render }) => {
      if (evalConditionValue(context, condition)) {
        return render(context)
      }
      return ""
    }),
    { condition }
  )
}

export function unless(condition) {
  if (arguments.length) {
    return new Block("unless", (context, { render }) => {
      if (evalConditionValue(context, condition)) {
        return ""
      }
      return render(context)
    })
  }
  return new Block(
    "unless",
    (context, { openBlock, render }) => {
      if (evalConditionValue(context, openBlock.condition)) {
        return ""
      }
      return render(context)
    },
    "when"
  )
}

export function end() {}

export function tmpl() {
  if (Array.isArray(arguments[0])) {
    return createTemplateWithOptions(
      undefined,
      arguments[0],
      [].slice.call(arguments, 1)
    )
  }
  const options = arguments[0]
  return function () {
    return createTemplateWithOptions(
      options,
      arguments[0],
      [].slice.call(arguments, 1)
    )
  }
}

export function each(input = {}) {
  let options

  if (typeof arguments[1] === "object") {
    options = arguments[1]
  } else {
    options = { value: arguments[1], key: arguments[2] }
  }
  const {
    value: valueProp = "value",
    key: keyProp = "key",
    separator,
  } = options

  const renderSeparator =
    typeof separator === "function"
      ? separator
      : separator
      ? () => separator
      : undefined

  return new Block("each", (context, { render }) => {
    const enumerable = typeof input === "function" ? input(context) : input

    const results = []
    const copyOfContext = { ...context }
    // array
    if (typeof enumerable.length === "number") {
      for (let i = 0; i < enumerable.length; i++) {
        copyOfContext[keyProp] = i
        copyOfContext[valueProp] = enumerable[i]
        if (renderSeparator && i) {
          results[results.length] = renderValue(
            renderSeparator(copyOfContext),
            copyOfContext
          )
        }
        results[results.length] = render(copyOfContext)
      }
    } else {
      const keys = Object.keys(enumerable)
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        copyOfContext[keyProp] = key
        copyOfContext[valueProp] = enumerable[key]
        if (renderSeparator && i) {
          results[results.length] = renderValue(
            renderSeparator(copyOfContext),
            copyOfContext
          )
        }
        results[results.length] = render(copyOfContext)
      }
    }
    return results.join("")
  })
}

function createTemplateWithOptions(options = {}, strings, args) {
  const parts = []
  const literal = []
  const blocks = []

  function flush() {
    const str = literal.join("")
    if (!str) return
    parts.push(createLiteralPart(str))
    literal.length = 0
  }

  function addBlockPart(block) {
    flush()
    parts.push(createBlockPart(options, block, parts.splice(block.index)))
  }

  for (let i = 0; i < args.length; i++) {
    let arg = args[i]
    literal.push(strings[i])
    if (arg === end) {
      if (!blocks.length) {
        throw new Error("No opened block")
      }

      const block = blocks.pop()
      addBlockPart(block)
      continue
    }

    if (arg === unless) {
      arg = unless()
    }

    // renderable value
    if (typeof arg === "function") {
      // complex value
      flush()
      parts.push(arg)
      continue
    }
    if (arg === null || typeof arg !== "object") {
      literal.push(arg)
      continue
    }
    if (arg instanceof Block) {
      if (arg.endOf) {
        const lastBlock = blocks.pop()
        if (!lastBlock || lastBlock.name !== arg.endOf) {
          throw new Error("Expected " + arg.endOf)
        }
        arg.openBlock = lastBlock
        addBlockPart(lastBlock)
      }
      blocks.push(arg)
      flush()
      arg.index = parts.length
      continue
    }

    // complex value
    flush()
    parts.push(
      Array.isArray(arg) ? createArrayPart(arg) : createObjectPart(arg)
    )
  }
  if (blocks.length) {
    throw new Error("Expected end of " + blocks[blocks.length - 1].name)
  }
  literal.push(strings[strings.length - 1])
  flush()

  return function () {
    if (typeof arguments[0] === "function")
      return createUpdater(options, parts, ...arguments)
    return renderParts({ options, parts }, { ...arguments[0] })
  }
}

function createBlockPart(options, block, parts) {
  const renderOptions = { options, parts }
  function render(context) {
    return renderParts(renderOptions, context)
  }
  return context => {
    return block.render(context, {
      options,
      parts,
      render,
      openBlock: block.openBlock,
    })
  }
}

export function renderParts({ options, parts }, context) {
  return parts
    .map(part => {
      let result = part(context, options)
      return renderValue(result, context)
    })
    .join("")
}

function renderValue(value, context) {
  if (typeof value === "function") return renderValue(value(context), context)
  if (value === null || typeof value !== "object") return "" + value
  if (Array.isArray(value)) return renderArray(value)
  return renderObject(value)
}

function createUpdater(options, parts, renderer, model) {
  const renderOptions = { options, parts }

  function render() {
    const result = renderParts(renderOptions, { ...model, $model: model })
    renderer(result)
  }

  function update(newModel) {
    if (arguments.length) {
      model = newModel
    }
    render()
  }

  if (arguments.length > 3) {
    render()
  }

  return {
    get model() {
      return model
    },
    update,
  }
}

function renderObject(object) {
  return JSON.stringify(object)
}

function renderArray(array) {
  return array.toString()
}

function createObjectPart(object) {
  return () => renderObject(object)
}

function createArrayPart(array) {
  return () => renderArray(array)
}

function createLiteralPart(literal) {
  return () => literal
}

export class Block {
  constructor(name, render, endOf) {
    this.render = render
    this.name = name
    this.endOf = endOf
  }
}
