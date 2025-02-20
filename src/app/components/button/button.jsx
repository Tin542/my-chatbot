
export const Button = (props) => {
  // eslint-disable-next-line react/prop-types
  const { onClick, children } = props;
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
      {children}
    </button>
  );
};
