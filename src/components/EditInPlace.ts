import React, { FC } from 'react'
import ContentEditable from 'react-contenteditable'

export interface EditInPlaceProps {
  value: any
}

// NEW syntax for typing function components
// export const EditInPlace: FC<EditInPlaceProps> = props => {
//   return (
//     <ContentEditable
//       innerRef={this.contentEditable}
//       html={this.state.html} // innerHTML of the editable div
//       disabled={false}       // use true to disable editing
//       onChange={this.handleChange} // handle innerHTML change
//       // tagName='article' // Use a custom HTML tag (uses a div by default)
//     />
//   )
// };
