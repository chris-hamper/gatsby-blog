import React from 'react'
import ContentEditable from 'react-contenteditable'

export const MyContentEditable = ({ input: { value, onChange }}) => {
  const [html, setHTML] = React.useState(value);
  const [isFocused, setIsFocused] = React.useState(false);

  // If value changes while blurred, update the field's content.
  React.useEffect(() => {
    if (!isFocused) {
      setHTML(value);
    }
  }, [value])

  const handleChange = evt => {
    // Maintain a copy of the field's content in state, and pass it up to parent.
    setHTML(evt.target.value);
    onChange(evt.target.value);
  }

  return <ContentEditable
      html={html}
      onChange={handleChange}
      onBlur={() => {setIsFocused(false)}}
      onKeyDown={() => {setIsFocused(true)}}
      // tagName='span' // Use a custom HTML tag (uses a div by default)
    />
}
