import React from 'react'
import ContentEditable from 'react-contenteditable'

export const MyContentEditable = ({ input: { value, onChange }}) => {
  const [state, setState] = React.useState(value);

  const handleChange = evt => {
    setState(evt.target.value);
    onChange(evt.target.value);
  };

  return <ContentEditable
      html={state} // innerHTML of the editable div
      disabled={false}       // use true to disable editing
      onChange={handleChange} // handle innerHTML change
      // tagName='span' // Use a custom HTML tag (uses a div by default)
    />
}
