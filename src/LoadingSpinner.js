import styles from "./LoadingSpinner.module.css";

import React from "react";

class LoadingSpinner extends React.Component {
  render() {
    return <div className={styles.spin}></div>;
  }
}

export default LoadingSpinner;
