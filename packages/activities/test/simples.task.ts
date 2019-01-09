import { Task, Activity, SequenceActivity, ActivityContext } from '../src';

@Task('stest')
export class SimpleTask extends Activity {
    protected async execute(): Promise<void> {
        // console.log('before simple task:', this.name);
        this.context.result = await Promise.resolve('simple task')
            .then(val => {
                console.log('return simple task:', val);
                return val;
            });
    }

}

@Task('comptest')
export class SimpleCTask extends SequenceActivity {

    protected async execute(): Promise<void> {
        await super.execute();
        // console.log('before component task:', this.name);
        this.context.result = await Promise.resolve('component task')
            .then(val => {
                console.log('return component task:', val);
                return val;
            });
    }
}


@Task({
    name: 'test-module',
    // activity: SequenceActivity,
    sequence: [
        {
            name: 'test------3',
            task: SimpleTask
        },
        {
            name: 'test------4',
            task: SimpleCTask
        }
    ]
})
export class TaskModuleTest extends SequenceActivity {

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