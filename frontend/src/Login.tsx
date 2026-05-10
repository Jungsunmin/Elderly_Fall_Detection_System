import { Navigate } from "react-router-dom";
//acesstoken을 받으면 recommand page로 이동
const Login = () => {
  const getUrlParameters = (name: string) => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    return params.get(name);
  };

  const token =
    getUrlParameters("token") ||
    getUrlParameters("accessToken") ||
    getUrlParameters("jwt");

  if (token) {
    localStorage.setItem("accessToken", token);

    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default Login;
