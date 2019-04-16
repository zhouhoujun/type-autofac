import { Task, Activity, SequenceActivity, ActivityContext, Activities } from '../src';

@Task('stest')
export class SimpleTask extends Activity<ActivityContext> {
    async execute(ctx: ActivityContext, next: () => Promise<void>): Promise<void> {
        // console.log('before simple task:', this.name);
        ctx.data = await Promise.resolve('simple task')
            .then(val => {
                console.log('return simple task:', val);
                return val;
            });
    }

}

@Task({
    selector: 'comptest',
    template: [
        { activity: Activities.if, condition: (ctx) => !!ctx.args[0], body: [] },
        {
            activity: Activities.else,
            body: [
                {
                    activity: Activities.switch,
                    switch: (ctx) => ctx.configures.length,
                    cases: [
                        { case: 1, body: [] }
                    ]
                }
            ]
        }
    ]
})
export class SimpleCTask extends SequenceActivity<ActivityContext> {

    async execute(ctx: ActivityContext, next?: () => Promise<void>): Promise<void> {
        await super.execute(ctx, next);
        // console.log('before component task:', this.name);
        ctx.data = await Promise.resolve('component task')
            .then(val => {
                console.log('return component task:', val);
                return val;
            });
    }
}


@Task({
    name: 'test-module',
    // activity: SequenceActivity,
    template: [
        {
            // name: 'test------3',
            activity: Activities.if,
            condition: ctx => ctx.args[0],
            body: [SimpleTask]
        },
        SimpleCTask
    ]
})
export class TaskModuleTest extends SequenceActivity<ActivityContext>  {

}



// async function test() {

//     let container = new Worflow(__dirname);

//     // container.use({ modules: [SimpleTask] });
//     await container.bootstrap(SimpleTask);


//     console.log('\n------------SimpleTask------------------');
//     let container2 = new Worflow(__dirname);
//     await container2.use(SimpleTask)
//         .bootstrap('test');

//     console.log('\n-----------SimpleCTask-------------------');
//     await Workflow.create( SimpleCTask)
//         .bootstrap('comptest');


//     console.log('\n-----------Custome Component-------------------');
//     await Workflow.create()
//         .bootstrap({
//             providers: {
//                 name: 'test1'
//             },
//             task: TaskElement,
//             children: [
//                 {
//                     providers: { name: 'test------1' },
//                     task: SimpleTask
//                 },
//                 {
//                     providers: { name: 'test------2' },
//                     task: SimpleCTask
//                 }
//             ]
//         });

//     console.log('\n-------------Component Module-----------------');
//     await Workflow.create()
//         .bootstrap(TaskModuleTest);
// }

// test();
