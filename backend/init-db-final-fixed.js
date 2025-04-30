const sequelize = require('./config/database');
const models = require('./models');

async function initializeDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced successfully.');

    const adminUser = await models.User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Admin user created.');

    const supervisorUser = await models.User.create({
      name: 'Supervisor User',
      email: 'supervisor@example.com',
      password: 'supervisor123',
      role: 'supervisor'
    });
    console.log('Supervisor user created.');

    const salesUser = await models.User.create({
      name: 'Sales User',
      email: 'sales@example.com',
      password: 'sales123',
      role: 'sales'
    });
    console.log('Sales user created.');

    const clients = await models.Client.bulkCreate([
      {
        code: 'C001',
        name: 'Empresa ABC',
        business: 'Retail',
        address: 'Calle Principal 123',
        locality: 'Ciudad Capital',
        department: 'Central',
        coordinates: { lat: -34.603722, lng: -58.381592 }
      },
      {
        code: 'C002',
        name: 'Industrias XYZ',
        business: 'Manufacturing',
        address: 'Av. Industrial 456',
        locality: 'Ciudad Industrial',
        department: 'Norte',
        coordinates: { lat: -34.608722, lng: -58.371592 }
      },
      {
        code: 'C003',
        name: 'Servicios 123',
        business: 'Services',
        address: 'Calle Comercial 789',
        locality: 'Ciudad Comercial',
        department: 'Sur',
        coordinates: { lat: -34.613722, lng: -58.361592 }
      }
    ]);
    console.log('Sample clients created.');

    const goals = await models.Goal.bulkCreate([
      {
        name: 'Incrementar Ventas Q2',
        description: 'Incrementar ventas de productos electrónicos en Q2',
        variable: 'revenue',
        productFamily: 'Electronics',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-06-30'),
        status: 'active'
      },
      {
        name: 'Nuevos Clientes Q2',
        description: 'Aumentar la cantidad de nuevos clientes en Q2',
        variable: 'clientCount',
        productFamily: 'All',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-06-30'),
        status: 'active'
      },
      {
        name: 'Retención Clientes Q2',
        description: 'Mejorar la retención de clientes en Q2',
        variable: 'nonRetainedClients',
        productFamily: 'Services',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2025-06-30'),
        status: 'active'
      }
    ]);
    console.log('Sample goals created.');

    const monthlyTargets = [];
    for (const goal of goals) {
      for (let month = 4; month <= 6; month++) {
        monthlyTargets.push({
          goalId: goal.id,
          responsibleId: month % 2 === 0 ? supervisorUser.id : salesUser.id,
          month,
          year: 2025,
          targetValue: 10000 + (month - 4) * 2000 + Math.floor(Math.random() * 1000)
        });
      }
    }
    await models.MonthlyTarget.bulkCreate(monthlyTargets);
    console.log('Monthly targets created.');

    const sales = [];
    const productNames = {
      'Electronics': ['Laptop', 'Smartphone', 'Tablet', 'Smart TV', 'Headphones'],
      'Services': ['Consultoría', 'Mantenimiento', 'Instalación', 'Capacitación', 'Soporte'],
      'Supplies': ['Papel', 'Tinta', 'Materiales', 'Herramientas', 'Accesorios']
    };
    
    for (const client of clients) {
      for (let i = 0; i < 5; i++) {
        const productFamily = ['Electronics', 'Services', 'Supplies'][Math.floor(Math.random() * 3)];
        const productName = productNames[productFamily][Math.floor(Math.random() * 5)];
        
        sales.push({
          clientId: client.id,
          date: new Date(2025, 3 + Math.floor(i/2), 1 + Math.floor(Math.random() * 28)),
          productFamily: productFamily,
          productName: productName,
          amount: 1000 + Math.floor(Math.random() * 5000),
          quantity: 1 + Math.floor(Math.random() * 10),
          invoiceNumber: `INV-${2025}${3 + Math.floor(i/2)}${client.id}${i}`
        });
      }
    }
    await models.Sale.bulkCreate(sales);
    console.log('Sample sales created.');

    const strategies = await models.Strategy.bulkCreate([
      {
        name: 'Promoción Especial',
        description: 'Ofrecer descuentos especiales a clientes existentes',
        type: 'specific',
        goalId: goals[0].id,
        clientId: clients[0].id,
        status: 'in_progress'
      },
      {
        name: 'Campaña Nuevos Clientes',
        description: 'Campaña para atraer nuevos clientes en el sector industrial',
        type: 'generic',
        goalId: goals[1].id,
        status: 'planned'
      },
      {
        name: 'Programa de Fidelización',
        description: 'Implementar programa de puntos para clientes frecuentes',
        type: 'generic',
        goalId: goals[2].id,
        status: 'planned'
      }
    ]);
    console.log('Sample strategies created.');

    const tasks = await models.Task.bulkCreate([
      {
        strategyId: strategies[0].id,
        title: 'Llamar a cliente ABC',
        description: 'Contactar para ofrecer promoción especial',
        clientId: clients[0].id,
        responsibleId: salesUser.id,
        dueDate: new Date('2025-04-20'),
        recurrence: 'none',
        status: 'in-progress',
        priority: 'medium'
      },
      {
        strategyId: strategies[1].id,
        title: 'Preparar material promocional',
        description: 'Diseñar folletos y presentaciones para nuevos clientes',
        responsibleId: supervisorUser.id,
        dueDate: new Date('2025-04-25'),
        recurrence: 'none',
        status: 'todo',
        priority: 'medium'
      },
      {
        strategyId: strategies[2].id,
        title: 'Visitar cliente XYZ',
        description: 'Presentar programa de fidelización',
        clientId: clients[1].id,
        responsibleId: salesUser.id,
        dueDate: new Date('2025-04-22'),
        recurrence: 'none',
        status: 'todo',
        priority: 'high',
        latitude: -34.608722,
        longitude: -58.371592
      }
    ]);
    console.log('Sample tasks created.');

    const commentData = [
      {
        content: 'Cliente interesado en promoción',
        type: 'client',
        referenceId: clients[0].id,
        authorId: salesUser.id
      },
      {
        content: 'Necesitamos más detalles sobre esta estrategia',
        type: 'strategy',
        referenceId: strategies[1].id,
        authorId: supervisorUser.id
      },
      {
        content: 'Visita reprogramada para la próxima semana',
        type: 'task',
        referenceId: tasks[2].id,
        authorId: salesUser.id
      }
    ];
    
    await models.Comment.bulkCreate(commentData);
    console.log('Sample comments created.');

    console.log('Database initialization completed successfully.');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    process.exit();
  }
}

initializeDatabase();
