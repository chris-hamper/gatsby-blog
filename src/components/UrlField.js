import React from 'react'

export function UrlField({input, meta, field}) {
  return (
    <div>
      <label htmFor={input.name}>{field.label || field.name}</label>
      <div>{field.description}</div>
      <input type="url" {...input} />
      <div class="field-error">{meta.error}</div>
    </div>
  )
}