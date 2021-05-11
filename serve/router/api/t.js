function sleep(t) {
    return new Promise(resolve => setTimeout(resolve, t));
}


async function fn2() {
    await sleep(5).then(val => {
        console.log('任务执行完成');
    });
    console.log('测试')
}

fn2()