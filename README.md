# evidencegraph-auditor.

# EvidenceGraph Auditor

EvidenceGraph Auditor es una aplicación de Atlassian Forge diseñada para imponer la integridad de datos en los flujos de trabajo de desarrollo de software. Actúa como un agente Zero-Trust que verifica que los tickets de Jira cerrados tengan evidencia real en Bitbucket.

## Características Principales
- **Verificación Zero-Trust:** Valida que los commits estén fusionados y aprobados antes de permitir el cierre de tickets.
- **Integración con Teamwork Graph:** Utiliza la API `/rest/dev-status` para vincular Jira y Bitbucket.
- **Agente Autónomo (Rovo):** Opera en segundo plano mediante webhooks y triggers de Forge.
- **Prevención de Alucinaciones:** Lógica determinista. No genera texto; verifica estados criptográficos y lógicos.

## Arquitectura
La aplicación utiliza el runtime de Node.js en Atlassian Forge. 
1. **Trigger:** `avi:jira:updated:issue` detecta cambios de estado.
2. **Función de Auditoría:** Consulta el estado de Bitbucket vía API.
3. **Actualización:** Modifica campos personalizados y añade comentarios en Jira basados en el resultado de la verificación (`VERIFIED`, `UNVERIFIED`, `NO_EVIDENCE`).

## Requisitos Previos
- Cuenta de Atlassian Cloud con permisos de administrador.
- Atlassian Forge CLI instalado localmente.
- Node.js v18 o superior.

## Instalación y Despliegue (Forge CLI)

1. Clonar el repositorio:
```bash
   git clone [URL_DEL_REPOSITORIO]
   cd evidencegraph-auditor
```

2. Instalar dependencias:
```bash
   npm install
```

3. Iniciar sesión en Forge:
```bash
   forge login
```

4. Registrar la aplicación:
```bash
   forge register
```

5. Desplegar en entorno de desarrollo:
```bash
   forge deploy -e development
```

6. Instalar la aplicación en su sitio de Atlassian:
```bash
   forge install -e development
```

## Uso
1. Vincule un repositorio de Bitbucket a su proyecto de Jira.
2. Cree un campo personalizado en Jira llamado "Evidence Status" (Single Select).
3. Cuando un desarrollador intente mover un ticket a "Done", el agente de EvidenceGraph Auditor interceptará la acción.
4. Si el Pull Request en Bitbucket no está fusionado y aprobado, el agente actualizará el campo "Evidence Status" a `UNVERIFIED` y añadirá un comentario automático.

## Licencia
Apache 2.0. Ver archivo LICENSE para más detalles.