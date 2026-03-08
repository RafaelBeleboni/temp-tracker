const http = require('http');
const readline = require('readline');

// Função para fazer login usando a página de login
const loginAndGetCookies = () => {
  return new Promise((resolve, reject) => {
    // Primeiro, fazer GET na página de login para pegar o session cookie
    const getOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/login',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const getReq = http.request(getOptions, (getRes) => {
      let cookies = '';
      
      // Capturar cookies da página de login
      if (getRes.headers['set-cookie']) {
        cookies = getRes.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');
      }

      let data = '';
      getRes.on('data', (chunk) => data += chunk);
      getRes.on('end', () => {
        // Agora fazer POST com o login
        const loginData = JSON.stringify({
          email: 'admin@meditemp.com',
          password: 'admin123',
          csrfToken: 'dummy' // Pode ser necessário extrair da página
        });

        const postOptions = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/auth/signin',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(loginData),
            'Cookie': cookies
          }
        };

        const postReq = http.request(postOptions, (postRes) => {
          let finalCookies = cookies;
          
          // Adicionar novos cookies
          if (postRes.headers['set-cookie']) {
            const newCookies = postRes.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');
            finalCookies = finalCookies ? `${finalCookies}; ${newCookies}` : newCookies;
          }

          let postData = '';
          postRes.on('data', (chunk) => postData += chunk);
          postRes.on('end', () => {
            console.log(`Login status: ${postRes.statusCode}`);
            console.log(`Login response: ${postData}`);
            console.log(`Final cookies: ${finalCookies}`);
            resolve(finalCookies);
          });
        });

        postReq.on('error', (e) => {
          console.error('Login POST error:', e);
          reject(e);
        });

        postReq.write(loginData);
        postReq.end();
      });
    });

    getReq.on('error', (e) => {
      console.error('Login GET error:', e);
      reject(e);
    });

    getReq.end();
  });
};

// Verificar status
const checkStatus = async (cookies) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/clear-temperatures',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.end();
  });
};

// Apagar temperaturas
const clearTemperatures = async (cookies) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/admin/clear-temperatures',
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    console.log(' Apagando todas as leituras de temperatura...');
    req.end();
  });
};

// Função principal
const main = async () => {
  try {
    console.log(' Fazendo login como admin...');
    
    // Fazer login
    const cookies = await loginAndGetCookies();
    
    if (!cookies) {
      console.log(' Falha ao fazer login - sem cookies');
      return;
    }

    console.log(' Login realizado com sucesso!');
    console.log('');

    // Verificar status
    console.log('🔍 Verificando status do banco de dados...');
    const statusResult = await checkStatus(cookies);
    
    if (statusResult.statusCode === 200) {
      const result = JSON.parse(statusResult.data);
      console.log(`📊 Status atual: ${result.message}`);
      
      if (result.totalRecords > 0) {
        console.log(`⚠️ ${result.totalRecords} registros serão apagados!`);
        console.log('');
        
        // Perguntar se quer continuar
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        
        rl.question('❓ Tem certeza que deseja apagar TODOS os registros? (s/N): ', async (answer) => {
          rl.close();
          
          if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
            const clearResult = await clearTemperatures(cookies);
            
            if (clearResult.statusCode === 200) {
              const result = JSON.parse(clearResult.data);
              if (result.success) {
                console.log(`✅ ${result.message}`);
                console.log(`📊 Registros apagados: ${result.deletedCount}`);
              } else {
                console.log(`❌ Erro: ${result.error}`);
              }
            } else {
              console.log(`❌ Erro HTTP: ${clearResult.statusCode}`);
              console.log(`Response: ${clearResult.data}`);
            }
          } else {
            console.log('❌ Operação cancelada pelo usuário.');
          }
        });
      } else {
        console.log('✅ Não há registros para apagar.');
      }
    } else {
      console.log(`❌ Erro ao verificar status: ${statusResult.statusCode}`);
      console.log(`Response: ${statusResult.data}`);
    }
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
};

// Iniciar
main();
