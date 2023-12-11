const request = require('supertest');
const UserRepo = require('../../repos/user-repo');
const pool = require('../../pool');
const buildApp = require('../../app');
const Context  = require('../context');

let context
beforeAll(async () => {
    context = await Context.build();
});

//We need to close bcoz jest will not automatically close the connection
//and jest will not exit automatically if connection is not closed
afterAll(() => {
    return context.close()
})

it('create a user', async () => {
    const startingCount = await UserRepo.count();

    await request(buildApp())
        .post('/users')
        .send({"username": "test-user", bio: "Testing Bio"})
        .expect(200);

    const finalCount = await UserRepo.count();
    expect(finalCount - startingCount).toEqual(1);
});