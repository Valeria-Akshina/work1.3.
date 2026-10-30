const { Op } = require('sequelize');
const { sequelize, User, Post, Author, Book, Student, Course, Enrollment, Order, Item } = require('./models');

async function getUsersWithRecentPosts() {
    return User.findAll({
        include: [{
        model: Post,
        as: 'posts',
        where: { publishedAt: { [Op.gt]: '2023-01-01' } },
        required: true,
        }],
        order: [
        ['name', 'ASC'],
        [{ model: Post, as: 'posts' }, 'publishedAt', 'DESC']
        ],
    });
}

async function getAllAuthorsIncludingEmpty() {
    return Author.findAll({
        include: [{
        model: Book,
        as: 'books',
        required: false,
        }],
        order: [['lastName', 'ASC']],
    });
}

async function getStudentsInAdvancedCourses() {
    return Student.findAll({
        include: [{
        model: Course,
        as: 'courses',
        where: { credits: { [Op.gt]: 3 } },
        required: true,
        through: { attributes: [] }
        }],
        order: [
        ['name', 'ASC'],
        [{ model: Course, as: 'courses' }, 'title', 'ASC']
        ],
    });
}

async function getOrdersWithBulkItems() {
    return Order.findAll({
        include: [{
        model: Item,
        as: 'items',
        where: { quantity: { [Op.gt]: 2 } },
        required: true,
        }],
        order: [
        ['createdAt', 'DESC'],
        [{ model: Item, as: 'items' }, 'price', 'DESC']
        ],
    });
}

async function getActiveUsersWithPublishedPosts() {
    return User.findAll({
        where: { isActive: true },
        include: [{
        model: Post,
        as: 'posts',
        where: { status: 'published' },
        required: true,
        }],
        order: [
        ['name', 'ASC'],
        [{ model: Post, as: 'posts' }, 'createdAt', 'DESC']
        ],
    });
}
async function main() {
    try {
        await sequelize.sync({ force: true });
        console.log('База данных успешно пересоздана.');

        const user1 = await User.create({ name: 'Алексей', email: 'alex@test.com', isActive: true });
        const user2 = await User.create({ name: 'Мария', email: 'maria@test.com', isActive: true });
        const user3 = await User.create({ name: 'Иван', email: 'ivan@test.com', isActive: false });

        await Post.create({ title: 'Пост старый', publishedAt: '2021-05-10', status: 'draft', authorId: user1.id });
        await Post.create({ title: 'Пост новый 1', publishedAt: '2023-06-15', status: 'published', authorId: user1.id });
        await Post.create({ title: 'Пост новый 2', publishedAt: '2024-01-01', status: 'published', authorId: user2.id });

        const author1 = await Author.create({ firstName: 'Лев', lastName: 'Толстой', country: 'Россия' });
        const author2 = await Author.create({ firstName: 'Фёдор', lastName: 'Достоевский', country: 'Россия' });
        const author3 = await Author.create({ firstName: 'Автор', lastName: 'Безкнижный', country: 'Неизвестно' });

        await Book.create({ title: 'Война и мир', year: 1869, genre: 'Роман', authorId: author1.id });
        await Book.create({ title: 'Преступление и наказание', year: 1866, genre: 'Роман', authorId: author2.id });

        const student1 = await Student.create({ name: 'Анна', group: 'CS-101' });
        const student2 = await Student.create({ name: 'Дмитрий', group: 'CS-102' });

        const course1 = await Course.create({ title: 'Базы данных', credits: 4 });
        const course2 = await Course.create({ title: 'История', credits: 2 });

        await student1.addCourses([course1, course2]);
        await student2.addCourses([course2]);

        const order1 = await Order.create({ number: 'ORD-001', status: 'new' });
        const order2 = await Order.create({ number: 'ORD-002', status: 'paid' });

        await Item.create({ productName: 'Ручка', quantity: 5, price: 50.00, orderId: order1.id });
        await Item.create({ productName: 'Ноутбук', quantity: 1, price: 50000.00, orderId: order1.id });
        await Item.create({ productName: 'Тетрадь', quantity: 3, price: 100.00, orderId: order2.id });

        console.log('\n РЕЗУЛЬТАТЫ \n');

        console.log('Задание 1:', JSON.stringify(await getUsersWithRecentPosts(), null, 2));
        console.log('Задание 2:', JSON.stringify(await getAllAuthorsIncludingEmpty(), null, 2));
        console.log('Задание 3:', JSON.stringify(await getStudentsInAdvancedCourses(), null, 2));
        console.log('Задание 4:', JSON.stringify(await getOrdersWithBulkItems(), null, 2));
        console.log('Задание 5:', JSON.stringify(await getActiveUsersWithPublishedPosts(), null, 2));

    } catch (error) {
        console.error('Ошибка:', error);
    } finally {
        await sequelize.close();
    }
    }

main();