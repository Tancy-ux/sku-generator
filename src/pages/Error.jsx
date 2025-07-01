const Error = () => {
  return (
    <div className="flex flex-col mt-25 justify-center items-center">
      <h1 className="text-3xl my-5">Sorry! Something went wrong!</h1>
      <a href="/" className="text-blue-400 text-xl hover:text-blue-500">
        Go back to homepage and try again!
      </a>
    </div>
  );
};

export default Error;
