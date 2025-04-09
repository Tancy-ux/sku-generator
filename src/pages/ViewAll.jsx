import ShowCeramic from "../components/ShowCeramic";
import ShowProducts from "../components/ShowProducts";

const ViewAll = () => {
  return (
    <div className="flex justify-around">
      <ShowCeramic />
      <ShowProducts />
    </div>
  );
};

export default ViewAll;
