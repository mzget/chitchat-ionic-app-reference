// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX


/// <reference path="../typings/tsd.d.ts" />


// tutorial1.js
var CommentBox = React.createClass({
    render: function () {
        return (
            <div className="commentBox">
                Hello, world!I am a CommentBox.
                </div>
        );
    }
});

React.render(
    <CommentBox />,
    document.getElementById('content')
);

