import { Navigate, useParams } from "react-router-dom";

const ProfessionLegacyRedirect = () => {
    const { id } = useParams();

    return <Navigate to={id ? `/profession/${id}` : "/professions"} replace />;
};

export default ProfessionLegacyRedirect;
