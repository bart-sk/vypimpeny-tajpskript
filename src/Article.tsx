import * as moment from "moment";
import * as React from "react";
import "./Article.css";

interface IProps {
  title: string;
  date: moment.Moment;
}

class Article extends React.Component<IProps> {
  render() {
    const { title, date } = this.props;
    return (
      <article>
        <header>{title}</header>
        <p>{date.format("DD.MM.YYYY")}</p>
      </article>
    );
  }
}

export default Article;
