import React, { useCallback, useEffect, useState } from 'react';

const MyComponent = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [data, setData] = useState(null);

  const dismiss = useCallback(() => {
    // 상태 업데이트를 useEffect로 이동
  }, []);

  useEffect(() => {
    // 여기서 상태 업데이트를 수행
    setIsVisible(false);
  }, [dismiss]);


  useEffect(() => {
    let isMounted = true;
    const updateState = async () => {
      try {
        // 비동기 작업 수행
        const response = await fetch('/api/data');
        const jsonData = await response.json();
        if (isMounted) {
          setData(jsonData);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    updateState();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      {isVisible && <p>This is visible</p>}
      {data && <pre>{JSON.stringify(data, null, 2)}</pre>}
      <button onClick={dismiss}>Dismiss</button>
    </div>
  );
};

export default MyComponent;