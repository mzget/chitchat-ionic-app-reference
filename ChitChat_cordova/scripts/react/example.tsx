// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX


/// <reference path="../typings/tsd.d.ts" />

var CommentBox = React.createClass({
    render: function () {
        return (
            <div className="commentBox">
        <h1>Comments</h1>
        <CommentList />
        <CommentForm />
                </div>
        );
    }
});

var CommentList = React.createClass({
    render: function () {
        return (
            <div className="commentList">
                Hello, world!I am a CommentList.
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

React.render(
    <CommentBox />,
    document.getElementById('content')
);

