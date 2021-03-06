import * as expect from 'expect';
import { IBootContext, BootApplication } from '@tsdi/boot';
import { TypeOrmHelper } from '../src';
import { Suite, Before, Test, After } from '@tsdi/unit';
import { User, Role } from './models/models';
import { UserRepository } from './repositories/UserRepository';
import { MockBootTest, connectOption } from './MockBootTest';





@Suite('Repository test')
export class ReposTest {

    private ctx: IBootContext;

    @Before()
    async beforeInit() {
        this.ctx = await BootApplication.run({
            type: MockBootTest,
            configures: [
                {
                    connections: {
                        ...connectOption,
                        entities: [
                            Role,
                            User
                        ]
                    }
                }
            ]
        });
    }

    @Test()
    async hasUserRepository() {
        expect(this.ctx.get(TypeOrmHelper).getRepository(User)).toBeDefined();
        expect(this.ctx.injector.has(UserRepository)).toBeTruthy();
    }

    @Test()
    async canGetUserRepository() {
        let rep = this.ctx.injector.get(UserRepository);
        expect(rep).toBeInstanceOf(UserRepository);
    }

    @Test()
    async save() {
        let rep = this.ctx.injector.get(UserRepository);
        let newUr = new User();
        newUr.name = 'admin----test';
        newUr.account = 'admin----test';
        newUr.password = '111111';
        await rep.save(newUr);
        let svu = await rep.findByAccount('admin----test')
        // console.log(svu);
        expect(svu).toBeInstanceOf(User);
        expect(svu.id).toBeDefined();
    }

    @Test()
    async deleteUser() {
        const rep = this.ctx.injector.get(UserRepository);
        let svu = await rep.findByAccount('admin----test');
        await rep.remove(svu);
    }


    @After()
    async after() {
        this.ctx.destroy()
    }

}

