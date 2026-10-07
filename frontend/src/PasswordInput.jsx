import { useState } from "react";

function PasswordInput({ id, name, value, onChange, placeholder, minLength }) {
  const [show, setShow] = useState(false);

  return (
    <div className="password-wrap">
      <input
        id={id}
        type={show ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        minLength={minLength}
        required
      />

      <button
        type="button"
        className="password-toggle"
        onClick={() => setShow(!show)}
      >
        {show ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export default PasswordInput;