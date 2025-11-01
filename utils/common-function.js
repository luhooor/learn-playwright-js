import { faker } from '@faker-js/faker';

export function generateRandomFirstName() {
    return faker.person.firstName();
}

export function generateRandomLastName() {
    return faker.person.lastName();
}

export function generateRandomEmail() {
    return faker.internet.email();
}