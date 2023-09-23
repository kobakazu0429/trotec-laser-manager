# trotec-laser-manager

## Usage

1. Download the latest binary from releases.
2. Run the binary from the command line like this.

### Mac/Linux

```bash
SPEEDY400_IP_ADDRESS=192.168.0.1 EMAIL=foo@example.com PASSWORD=Bar ./trotec-laser-manager
```

### Windows

```powershell
$env:SPEEDY400_IP_ADDRESS="192.168.0.1"
$env:EMAIL="foo@example.com"
$env:PASSWORD="Bar"
.\trotec-laser-manager.exe
```

### Optional environment variables:

- PORT: The port to listen on. Defaults to 8000.
