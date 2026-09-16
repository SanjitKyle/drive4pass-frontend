import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";

export const GridViewTemplate = (props) => {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/pupil/${props._id}`);
  };

  return (
    <div className="flex items-center justify-center w-full">
      <FaEye
        onClick={handleView}
        className="cursor-pointer text-blue-600 hover:text-blue-800"
        size={18}
      />
    </div>
  );
};
