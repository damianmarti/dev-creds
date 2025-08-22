import { signIn } from "next-auth/react";

const LinkGithub = () => {
  return (
    <button
      onClick={() => {
        signIn("github", {});
      }}
      className="btn btn-primary mt-5"
    >
      Sign in with GitHub
    </button>
  );
};

export default LinkGithub;
