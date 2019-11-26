import React from 'react'
import ContentEditable from 'react-contenteditable'

type Props = {
  input: Input,
}

type Input = {
  value: string,
  onChange(value: string): void,
  onFocus(): void,
  onBlur(): void,
}

export const EditableContent = (props: Props) => {
  const { input } = props;
  const [html, setHTML] = React.useState(input.value);
  const [isFocused, setIsFocused] = React.useState(false);

  // If value changes while blurred, update the field's content.
  React.useEffect(() => {
    if (!isFocused) {
      setHTML(input.value);
      console.log("useEffect !isFocused", input.value)
    }
  }, [input.value])

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    const { target: { value } } = evt;

    console.log("handleChange", value)

    // Maintain a copy of the field's content in state, and pass it up to parent.
    setHTML(value);
    input.onChange(value);
  }

  return <ContentEditable
      html={html}
      onChange={handleChange}
      onBlur={() => {setIsFocused(false)}}
      onKeyDown={() => {setIsFocused(true)}}
      // tagName='span' // Use a custom HTML tag (uses a div by default)
    />
}
