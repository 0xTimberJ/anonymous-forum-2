# Infrastructure Deployment avec Terraform Cloud

## Architecture CI/CD

### 1. GitHub Actions (.github/workflows/ci.yml)

- **Lint** : Vérifie la qualité du code API
- **Build** : Construit l'image Docker de l'API
- **Push** : Envoie l'image vers GitHub Container Registry (ghcr.io)

### 2. Terraform Cloud (VCS-Driven Workflow)

- **State Management** : Le state est automatiquement sauvegardé sur Terraform Cloud (pas en local)
- **VCS Integration** : Détecte les push sur master dans le dossier `terraform/`
- **Workflow** :
  1. Push sur GitHub → Terraform Cloud détecte le changement
  2. Plan automatique généré
  3. Validation manuelle via UI Terraform Cloud
  4. Apply automatique → déploie sur AWS

**Workspace** : https://app.terraform.io/app/forum-anonymous/workspaces/anonymous-forum-2

## Configuration locale (si besoin)

```bash
# Install AWS CLI & Terraform
aws configure

# Login Terraform Cloud
terraform login

# Init (se connecte à TF Cloud)
cd terraform
terraform init
```

## Ressources déployées

- **Postgres Instance** : EC2 avec Docker + PostgreSQL
- **API Instance** : EC2 avec Docker + NestJS API
- **Security Group** : Ouvre ports 22, 80, 3001, 5432
- **Key Pair** : SSH key pour connexion aux instances

## État actuel du déploiement

### API EC2

- **IP** : http://18.199.106.210:3001
- **Health check** : `curl http://18.199.106.210:3001` → "Hello World!"
- **Messages endpoint** : http://18.199.106.210:3001/messages

### Postgres EC2

- **Private IP** : 172.31.38.147
- **Public IP** : 3.121.229.247
- **Port** : 5432

### SSH Access

```bash
ssh -i forum-key.pem ec2-user@18.199.106.210
```

## Pourquoi Terraform Cloud?

Comme recommandé par le prof sur Teams :

> "N'oubliez pas de faire attention à bien sauvegarder votre State en utilisant Terraform Cloud par exemple si vous êtes sur Github Actions."

**Avantages** :

- ✅ State persisté automatiquement (pas de perte entre les runs CI)
- ✅ Locking automatique (évite les conflits)
- ✅ UI pour valider les plans avant apply
- ✅ Historique des runs
- ✅ VCS-driven workflow (GitOps)

## Preuve de fonctionnement

```bash
# Test API
curl http://18.199.106.210:3001
# StatusCode : 200
# Content : Hello World!

# Test Messages endpoint
curl http://18.199.106.210:3001/messages
# StatusCode : 200
# Content : []
```

---

**Note** : Le déploiement est géré par Terraform Cloud, pas directement dans la CI GitHub Actions. C'est la best practice recommandée pour éviter les problèmes de state management.
