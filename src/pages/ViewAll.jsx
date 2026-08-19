import ShowCeramic from "../components/ShowCeramic";
import ShowMaterial from "../components/ShowMaterial";
import ShowTypes from "../components/ShowTypes";

const ViewAll = () => {
  return (
    <div className="flex justify-around">
      <ShowMaterial />
      <ShowTypes />
      <ShowCeramic />
    </div>
  );
};

export default ViewAll;
