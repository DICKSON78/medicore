import { useState } from "react";

const usePatch = (uri, payload = null) => {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();

  const handlePatch = (newUri, newPayload = null) => {
    if (typeof newUri === "string") {
      uri = newUri;
    }

    if (newPayload) {
      payload = newPayload;
    }

    setData(null);
    setLoading(true);
    setError(null);

    return window.axios.patch("/" + uri, payload, {
      timeout: 45000
    })
      .then((response) => {
        setData(response.data);
        setLoading(false);
        return response.data;
      })
      .catch((error) => {
        setLoading(false);
        setError(error);
        console.error('API Error:', error.message);
        throw error;
      });
  };

  return { data, loading, error, handlePatch, setData, setError };
};

export default usePatch;
