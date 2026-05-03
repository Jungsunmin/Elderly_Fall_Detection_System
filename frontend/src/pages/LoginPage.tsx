import loginIcon from "../assets/loginIcon.svg";
import google from "../assets/google.svg";

import { login } from "../apis/auth/ApiService";

const LoginPage = () => {
  return (
    <main className="flex h-dvh w-full flex-col items-center justify-between bg-[#f3f3f3] px-5 py-10">
      <section className="flex flex-1 flex-col items-center justify-center">
        <img
          src={loginIcon}
          alt="ElderSafe 로고"
          className="h-[64px] w-[64px]"
        />
        <h1 className="mt-3 text-[36px] font-bold leading-none text-black">
          ElderSafe
        </h1>
        <p className="mt-2 text-[14px] text-[#707070]">
          어르신 안전 모니터링을 시작해보세요.
        </p>
      </section>
      <section className="w-full max-w-[360px] space-y-3 pb-6">
        <button
          type="button"
          onClick={() => login()}
          className="flex h-[48px] w-full items-center justify-center gap-4 rounded-[12px] bg-white border border-[#E6E6E6]"
        >
          <img
            src={google}
            alt="구글로 시작하기"
            className="h-[12px] w-[12px] max-w-[250px]"
          />
          <p>구글로 시작하기</p>
        </button>
      </section>
    </main>
  );
};

export default LoginPage;
