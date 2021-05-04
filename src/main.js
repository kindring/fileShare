import _ from 'loadsh';
import './css/index.css';
import './css/index.less';
console.log('你好');

function component() {
    var element = document.createElement('div');
    element.innerHTML = _.join(['Hello', 'webpack'], ' ');
    return element;
}

document.body.appendChild(component());