import React from 'react'
import ContentEditable from 'react-contenteditable'

// export const MyContentEditable = ({ input: { value, onChange }}) => {
//   // const [state, setState] = React.useState(props.input.value)

//   let contentEditable = React.createRef();

//   let handleChange = evt => {
//     // setValue(evt.target.value);
//     onChange(evt.target.value);
//   };

//   return <ContentEditable
//       innerRef={contentEditable}
//       html={value} // innerHTML of the editable div
//       disabled={false}       // use true to disable editing
//       onChange={handleChange} // handle innerHTML change
//       // tagName='article' // Use a custom HTML tag (uses a div by default)
//     />
// }

export class MyContentEditable extends React.Component {
  constructor(props) {
    super(props)
    this.contentEditable = React.createRef();
    console.log(props.input)
    this.state = {value: props.input.value}
    this.onChange = props.input.onChange;
  }

  handleChange = evt => {
    this.setState({value: evt.target.value});
    this.onChange(evt.target.value);
  };

  render() {
    // let { input, plugins, frame, ...styleProps } = this.props;

    return (
        <ContentEditable
          innerRef={this.contentEditable}
          html={this.state.value} // innerHTML of the editable div
          disabled={false}       // use true to disable editing
          onChange={this.handleChange} // handle innerHTML change
          // tagName='article' // Use a custom HTML tag (uses a div by default)
        />
    )
  }
}
