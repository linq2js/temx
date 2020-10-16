import { tmpl, each, end, when, unless } from "./index"

test("greeting", () => {
  const result = tmpl`Hi ${x => x.name}`({ name: "John" })

  expect(result).toBe("Hi John")
})

test("each()", () => {
  const result = tmpl`${each([1, 2, 3], { separator: "," })} [${({ value }) =>
    value}] ${end}`()
  expect(result).toBe(" [1] , [2] , [3] ")
})

test("when(condition)", () => {
  expect(tmpl`${when(true)}true${end}`()).toBe("true")
  expect(tmpl`${when(() => true)}true${end}`()).toBe("true")
  expect(tmpl`${when(false)}true${end}`()).toBe("")
  expect(tmpl`${when(() => false)}true${end}`()).toBe("")
})

test("when(condition) -> unless -> end", () => {
  const template = tmpl`${when(x => x.value)}true${unless}false${end}`
  expect(template({ value: true })).toBe("true")
  expect(template({ value: false })).toBe("false")
})

test("unless(condition)", () => {
  const template = tmpl`${unless(x => x.value)}true${end}`
  expect(template({ value: true })).toBe("")
  expect(template({ value: false })).toBe("true")
})
