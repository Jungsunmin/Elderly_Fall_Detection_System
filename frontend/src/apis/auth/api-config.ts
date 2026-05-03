let backendhost;

const hostname = window && window.location && window.location.hostname;
if (hostname === "localhost") {
    backendhost = "http://localhost:8080";
}
else{
    backendhost ="";//실제 배포된 주소 사용
}

export const API_BASE_URL = `${backendhost}`;