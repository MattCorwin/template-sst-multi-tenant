import { useEffect, useState } from "react";
import { authedGetCall, authedPostCall } from "./utils/utils";
import "./App.css";

const App = () => {
  const [session, setSession] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState();

  const getSession = async () => {
    const token = localStorage.getItem("session");
    if (token) {
      // console.log(`found token ${token}, calling getUserInfo`);
      const user = await getUserInfo(token);
      if (user) setSession(user);
    }
    setLoading(false);
  };

  useEffect(() => {
    getSession();
  }, []);

  useEffect(() => {
    const search = window.location.search;
    const params = new URLSearchParams(search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("session", token);
      window.location.replace(window.location.origin);
    }
  }, []);

  const getUserInfo = async (session) => {
    let config = {
      url: `${import.meta.env.VITE_APP_API_URL}/session`,
      session,
    };
    try {
      const response = await fetch(
        `${import.meta.env.VITE_APP_API_URL}/session`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session}`,
          },
        }
      );
      return response.json();
    } catch (error) {
      console.log(`fetch error: ${JSON.stringify(config)}`);
    }
  };

  const getDocuments = async () => {
    const path = "/documents";
    const docsResponse = await authedGetCall(path);
    setDocuments(docsResponse.map((item) => item.body));
  };

  const postDocument = async () => {
    const path = "/document";
    const localInput = inputValue;
    setInputValue("");
    const currentDocuments = documents;
    setDocuments([...documents, inputValue]);
    try {
      await authedPostCall(path, localInput);
    } catch (error) {
      console.log(error);
      setDocuments(currentDocuments);
      setInputValue(localInput);
    }
  };

  const signOut = async () => {
    localStorage.removeItem("session");
    setSession(null);
  };

  const updateInputValue = (event) => {
    setInputValue(event.target.value);
  };

  if (loading) return <div className="container">Loading...</div>;
  return (
    <div className="container">
      <h2>SST Notes App</h2>
      {session ? (
        <div className="profile">
          <p>Welcome {session.name}!</p>
          <img
            src={session.picture}
            style={{ borderRadius: "50%" }}
            width={100}
            height={100}
            alt=""
          />
          <p>{session.email}</p>
          <button onClick={signOut}>Sign out</button>
          <button style={{ marginTop: "1em" }} onClick={getDocuments}>
            Get request
          </button>
          {documents.length ? (
            <ul>
              {documents.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <></>
          )}
          <div>
            <input
              value={inputValue}
              onChange={updateInputValue}
              style={{ margin: "1em", height: "2em" }}
            ></input>
            <button onClick={postDocument}>Post Doc</button>
          </div>
        </div>
      ) : (
        <div>
          <a
            href={`${import.meta.env.VITE_APP_API_URL}/auth/google/authorize`}
            rel="noreferrer"
          >
            <button>Sign in with Google</button>
          </a>
        </div>
      )}
    </div>
  );
};

export default App;
