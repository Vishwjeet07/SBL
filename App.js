import React from "react";
import { useForm } from "react-hook-form";
import "./App.css";

function App() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
    alert("Login Successful");
  };

  return (
    <div className="login">
      <h1>Login Form</h1>

      <form onSubmit={handleSubmit(onSubmit)}>

        <label>Email</label>

        <input
          type="email"
          placeholder="Enter Email"
          {...register("email", {
            required: "Email is required"
          })}
        />

        {errors.email && (
          <p className="error">{errors.email.message}</p>
        )}

        <label>Password</label>

        <input
          type="password"
          placeholder="Enter Password"
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 6,
              message: "Password must be at least 6 characters"
            }
          })}
        />

        {errors.password && (
          <p className="error">{errors.password.message}</p>
        )}

        <button type="submit">Login</button>

      </form>
    </div>
  );
}

export default App;