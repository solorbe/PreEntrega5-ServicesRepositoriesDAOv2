// import fs from 'fs/promises';

// const filePath = './src/data/services.json';

// const readServices = async () => {
//   try {
//     const data = await fs.readFile(filePath, 'utf-8');

//     return JSON.parse(data);
//   } catch (error) {
//     return [];
//   }
// };

// const writeServices = async (services) => {
//   await fs.writeFile(filePath, JSON.stringify(services, null, 2));
// };

// export const getServices = async () => {
//   const services = await readServices();

//   return services;
// };

// export const getServiceById = async (id) => {
//   const services = await readServices();

//   const service = services.find((service) => service.id === Number(id));

//   if (!service) {
//     return null;
//   }

//   return service;
// };

// export const addService = async (serviceData) => {
//   const { name, description, duration, price, category, available } = serviceData;

//   if (!name || !description || !duration || !price || !category || available === undefined) {
//     return {
//       status: "error",
//       message: "Faltan campos obligatorios"
//     };
//   }

//   const services = await readServices();

//   const newService = {
//     id: services.length > 0
//       ? services[services.length - 1].id + 1
//       : 1,
//     name,
//     description,
//     duration,
//     price,
//     category,
//     available: available ?? true
//   };

//   services.push(newService);

//   await writeServices(services);

//   return {
//     status: "success",
//     payload: newService
//   };
// };

// export const updateService = async (id, serviceData) => {
//   const services = await readServices();

//   const serviceIndex = services.findIndex((service) => service.id === Number(id));

//   if (serviceIndex === -1) {
//     return null;
//   }

//   const updatedService = {
//     ...services[serviceIndex],
//     ...serviceData,
//     id: services[serviceIndex].id
//   };

//   services[serviceIndex] = updatedService;

//   await writeServices(services);

//   return {
//     status: 'success',
//     payload: updatedService
//   };
// };

// export const deleteService = async (id) => {
//   const services = await readServices();

//   const serviceIndex = services.findIndex((service) => service.id === Number(id));

//   if (serviceIndex === -1) {
//     return null;
//   }

//   const deletedService = services.splice(serviceIndex, 1);

//   await writeServices(services);

//   return {
//     status: 'success',
//     payload: deletedService[0]
//   };
// };

// export class ServiceManager  {
//   async getServices() {
//     return await getServices();
//   }

//   async getServiceById(id) {
//     return await getServiceById(id);
//   }

//   async addService(serviceData) {
//     return await addService(serviceData);
//   }

//   async updateService(id, serviceData) {
//     return await updateService(id, serviceData);
//   }

//   async deleteService(id) {
//     return await deleteService(id);
//   }
// };

import fs from 'fs/promises';
import {ServiceRepository} from "../repositories/services.repository.js";

export class ServiceFsDao {
  // Ruta al archivo donde vive el "estado" del recurso. Es una ruta
  // relativa: se resuelve desde el directorio donde se ejecuta el
  // proceso de Node (la raíz del proyecto).
  PATH = './src/data/services.json';

  // #readAll() y #writeAll() son privados (el # es sintaxis de campos y
  // métodos privados de clase en JS): solo se llaman desde adentro de
  // esta clase. Centralizan el acceso al archivo para que los métodos
  // públicos no repitan la lógica de leer/parsear o serializar/escribir.
  // Lee el archivo completo y lo devuelve parseado como array. Si el
  // archivo no existe todavía, o su contenido no es JSON válido,
  // devolvemos un array vacío en vez de romper la aplicación.
  async #readAll() {
    try {
      const content = await fs.readFile(this.PATH, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      return [];
    }
  }

  // Recibe el array completo y lo escribe en el archivo, reemplazando su contenido anterior. El tercer argumento de JSON.stringify
  // (2) indenta el JSON para que quede legible al abrirlo a mano.
  async #writeAll(services) {
    await fs.writeFile(this.PATH, JSON.stringify(services, null, 2));
  }

  // Devuelve el array completo de servicios tal como está en el archivo.
  async getAll() {
    return this.#readAll();
  }

  // Busca el servicio cuyo id coincida. Devuelve el servicio encontrado,
  // o null si no existe (la capa de arriba decide qué hacer con ese null).
  async getById(id) {
    const services = await this.#readAll();
    const service = services.find((s) => s.id === Number(id));
    return service ?? null;
  }

  // Flujo: leer todo -> calcular el próximo id -> armar el objeto nuevo
  // -> agregarlo al array -> escribir todo de nuevo en el archivo.
  async create(data) {
    const services = await this.#readAll();

    // Id incremental: buscamos el mayor id existente y sumamos 1. Si el
    // archivo está vacío, arrancamos en 1.
    const maxId = services.reduce((max, s) => Math.max(max, s.id), 0);

    const newService = { id: maxId + 1, ...data };

    services.push(newService);
    await this.#writeAll(services);

    return newService;
  }

  // Flujo: leer todo -> buscar el índice -> si no existe, devolver null
  // -> si existe, mezclar los campos actuales con los nuevos
  // (preservando el id original) -> escribir todo de nuevo.
  async update(id, data) {
    const services = await this.#readAll();
    const index = services.findIndex((s) => s.id === Number(id));

    if (index === -1) {
      return null;
    }

    const updatedService = { ...services[index], ...data, id: services[index].id };
    services[index] = updatedService;
    await this.#writeAll(services);

    return updatedService;
  }

  // Flujo: leer todo -> buscar el índice -> si no existe, devolver null
  // -> si existe, quitarlo del array con splice -> escribir todo de
  // nuevo -> devolver el servicio eliminado.
  async delete(id) {
    const services = await this.#readAll();
    const index = services.findIndex((s) => s.id === Number(id));
    if (index === -1) {
      return null;
    }
    const [deletedService] = services.splice(index, 1);
    await this.#writeAll(services);
    return deletedService;
  }
}
