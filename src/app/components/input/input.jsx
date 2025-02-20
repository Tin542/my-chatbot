
import TextareaAutosize from "react-textarea-autosize";

export const Input = (props) => {
  // eslint-disable-next-line react/prop-types
  const { value, onChange, placeholder, onKeyDown } = props;
  return (
    <TextareaAutosize
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onKeyDown={onKeyDown}
      className="flex-1 p-2 text-black border rounded-lg resize-none"
      minRows={1} // Số dòng tối thiểu
      maxRows={10} // Số dòng tối đa
    />
  );
};
