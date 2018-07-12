import * as moment from "moment";
import * as React from "react";
import "./App.css";
import Article from "./Article";

interface IState {
  articles: string[];
}

class App extends React.Component<{}, IState> {
  state = {
    articles: []
  };

  handleClick = () => {
    this.setState({
      articles: [...this.state.articles, "Dalsi clanok"]
    });
  };

  render() {
    return (
      <div className="App">
        {this.state.articles.map((title, idx) => {
          return <Article key={idx} title={title} date={moment()} />;
        })}
        <button onClick={this.handleClick}>Pridat clanok</button>
      </div>
    );
  }
}

export default App;
