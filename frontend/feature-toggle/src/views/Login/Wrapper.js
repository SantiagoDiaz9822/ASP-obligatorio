import styled from "styled-components";

export const LogInButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  border-radius: 10px;
  width: 10rem;
  height: 3rem;
  background-color: blue;
  &:hover {
    background-color: #0f5132;
  }
  color: white;
`;

export const SignInButton = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.75);
  border-radius: 10px;
  width: 10rem;
  height: 3rem;
  background-color: green;
  &:hover {
    background-color: #0f5132;
  }
  color: white;
`;
