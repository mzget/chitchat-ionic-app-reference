// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX


/// <reference path="../typings/tsd.d.ts" />

var data = [
    { author: "Pete Hunt", text: "This is one comment" },
    { author: "Jordan Walke", text: "This is *another* comment" },
    { author: "Name Surname", text: "This is *another* comment" }
];

var CommentBox = React.createClass({
    render: function () {
        return (
            <div className="commentBox">
        <h1>Comments</h1>
        <CommentList data = {data}/>
        <CommentForm />
                </div>
        );
    }
});

interface ICommentList {
    data: Array<any>;
}
var CommentList = React.createClass<ICommentList, any>({
    render: function () {
        var commentNodes = this.props.data.map(function (comment) {
            return (
                <Comment1 author={comment.author}>
                {comment.text}
                    </Comment1>
            );
        });
        return (
            <div className="commentList">
            {commentNodes}
                </div>
        );
        }
        });

var CommentForm = React.createClass({
    render: function () {
        return (
            <div className="commentForm">
                Hello, world!I am a CommentForm.
                </div>
        );
    }
});

interface Comment1Prop {
    author: string;
    //   children: string;
}
var Comment1 = React.createClass<Comment1Prop, any>({
    rawMarkup: function () {
        var rawMarkup = marked(this.props.children.toString(), { sanitize: true });
        return { __html: rawMarkup };
    },

    render: function () {
        return (
            <div className="comment">
<h2 className="commentAuthor">
  {this.props.author}
    </h2>
<span dangerouslySetInnerHTML={this.rawMarkup() } />
                </div>
        );
    }
});

React.render(
    < CommentBox />,
    document.getElementById('content')
);

